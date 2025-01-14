import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { AssetType, CreateAssetInput } from '@vendure/common/lib/generated-types';
import { ID, PaginatedList, Type } from '@vendure/common/lib/shared-types';
import { notNullOrUndefined } from '@vendure/common/lib/shared-utils';
import { ReadStream } from 'fs-extra';
import sizeOf from 'image-size';
import mime from 'mime-types';
import path from 'path';
import { Stream } from 'stream';
import { Connection, Like } from 'typeorm';

import { InternalServerError } from '../../common/error/errors';
import { ListQueryOptions } from '../../common/types/common-types';
import { getAssetType, idsAreEqual } from '../../common/utils';
import { ConfigService } from '../../config/config.service';
import { Logger } from '../../config/logger/vendure-logger';
import { Asset } from '../../entity/asset/asset.entity';
import { OrderableAsset } from '../../entity/asset/orderable-asset.entity';
import { VendureEntity } from '../../entity/base/base.entity';
import { ListQueryBuilder } from '../helpers/list-query-builder/list-query-builder';

export interface EntityWithAssets extends VendureEntity {
    featuredAsset: Asset;
    assets: OrderableAsset[];
}

@Injectable()
export class AssetService {
    constructor(
        @InjectConnection() private connection: Connection,
        private configService: ConfigService,
        private listQueryBuilder: ListQueryBuilder,
    ) {}

    findOne(id: ID): Promise<Asset | undefined> {
        return this.connection.getRepository(Asset).findOne(id);
    }

    /**
     * Locates an Asset by the filename of the source file. If "exact" is set to false, filename will
     * be looked up without the extension and with a "%" wildcard at the end. This is useful for finding
     * files that may have been automatically renamed with a suffix by the AssetNamingStrategy.
     */
    findByFileName(fileName: string, exact: boolean = true): Promise<Asset | undefined> {
        const source = exact ? fileName : Like(path.basename(fileName, path.extname(fileName)) + '%');
        return this.connection.getRepository(Asset).findOne({
            where: {
                source,
            },
        });
    }

    findAll(options?: ListQueryOptions<Asset>): Promise<PaginatedList<Asset>> {
        return this.listQueryBuilder
            .build(Asset, options)
            .getManyAndCount()
            .then(([items, totalItems]) => ({
                items,
                totalItems,
            }));
    }

    async getFeaturedAsset<T extends EntityWithAssets>(entity: T): Promise<Asset | undefined> {
        const entityType = Object.getPrototypeOf(entity).constructor;
        const entityWithFeaturedAsset = await this.connection
            .getRepository<EntityWithAssets>(entityType)
            .findOne(entity.id, {
                relations: ['featuredAsset'],
            });
        return entityWithFeaturedAsset && entityWithFeaturedAsset.featuredAsset;
    }

    async getEntityAssets<T extends EntityWithAssets>(entity: T): Promise<Asset[] | undefined> {
        let assets = entity.assets;
        if (!assets) {
            const entityType = Object.getPrototypeOf(entity).constructor;
            const entityWithAssets = await this.connection
                .getRepository<EntityWithAssets>(entityType)
                .findOne(entity.id, {
                    relations: ['assets'],
                });
            assets = (entityWithAssets && entityWithAssets.assets) || [];
        }
        return assets.sort((a, b) => a.position - b.position).map(a => a.asset);
    }

    async updateFeaturedAsset<T extends EntityWithAssets>(
        entity: T,
        featuredAssetId?: ID | null,
    ): Promise<T> {
        if (!featuredAssetId) {
            return entity;
        }
        const featuredAsset = await this.findOne(featuredAssetId);
        if (featuredAsset) {
            entity.featuredAsset = featuredAsset;
        }
        return entity;
    }

    /**
     * Updates the assets / featuredAsset of an entity, ensuring that only valid assetIds are used.
     */
    async updateEntityAssets<T extends EntityWithAssets>(entity: T, assetIds?: ID[] | null): Promise<T> {
        if (!entity.id) {
            throw new InternalServerError('error.entity-must-have-an-id');
        }
        if (assetIds && assetIds.length) {
            const assets = await this.connection.getRepository(Asset).findByIds(assetIds);
            const sortedAssets = assetIds
                .map(id => assets.find(a => idsAreEqual(a.id, id)))
                .filter(notNullOrUndefined);
            this.removeExistingOrderableAssets(entity);
            entity.assets = await this.createOrderableAssets(entity, sortedAssets);
        }
        return entity;
    }

    /**
     * Create an Asset based on a file uploaded via the GraphQL API.
     */
    async create(input: CreateAssetInput): Promise<Asset> {
        const { createReadStream, filename, mimetype } = await input.file;
        const stream = createReadStream();
        return this.createAssetInternal(stream, filename, mimetype);
    }

    /**
     * Create an Asset from a file stream created during data import.
     */
    async createFromFileStream(stream: ReadStream): Promise<Asset> {
        const filePath = stream.path;
        if (typeof filePath === 'string') {
            const filename = path.basename(filePath);
            const mimetype = mime.lookup(filename) || 'application/octet-stream';
            return this.createAssetInternal(stream, filename, mimetype);
        } else {
            throw new InternalServerError(`error.path-should-be-a-string-got-buffer`);
        }
    }

    private async createAssetInternal(stream: Stream, filename: string, mimetype: string): Promise<Asset> {
        const { assetOptions } = this.configService;
        const { assetPreviewStrategy, assetStorageStrategy } = assetOptions;
        const sourceFileName = await this.getSourceFileName(filename);
        const previewFileName = await this.getPreviewFileName(sourceFileName);

        const sourceFileIdentifier = await assetStorageStrategy.writeFileFromStream(sourceFileName, stream);
        const sourceFile = await assetStorageStrategy.readFileToBuffer(sourceFileIdentifier);
        const preview = await assetPreviewStrategy.generatePreviewImage(mimetype, sourceFile);
        const previewFileIdentifier = await assetStorageStrategy.writeFileFromBuffer(
            previewFileName,
            preview,
        );
        const type = getAssetType(mimetype);
        const { width, height } = this.getDimensions(type === AssetType.IMAGE ? sourceFile : preview);

        const asset = new Asset({
            type,
            width,
            height,
            name: sourceFileName,
            fileSize: sourceFile.byteLength,
            mimeType: mimetype,
            source: sourceFileIdentifier,
            preview: previewFileIdentifier,
        });
        return this.connection.manager.save(asset);
    }

    private async getSourceFileName(fileName: string): Promise<string> {
        const { assetOptions } = this.configService;
        return this.generateUniqueName(fileName, (name, conflict) =>
            assetOptions.assetNamingStrategy.generateSourceFileName(name, conflict),
        );
    }

    private async getPreviewFileName(fileName: string): Promise<string> {
        const { assetOptions } = this.configService;
        return this.generateUniqueName(fileName, (name, conflict) =>
            assetOptions.assetNamingStrategy.generatePreviewFileName(name, conflict),
        );
    }

    private async generateUniqueName(
        inputFileName: string,
        generateNameFn: (fileName: string, conflictName?: string) => string,
    ): Promise<string> {
        const { assetOptions } = this.configService;
        let outputFileName: string | undefined;
        do {
            outputFileName = generateNameFn(inputFileName, outputFileName);
        } while (await assetOptions.assetStorageStrategy.fileExists(outputFileName));
        return outputFileName;
    }

    private getDimensions(imageFile: Buffer): { width: number; height: number } {
        try {
            const { width, height } = sizeOf(imageFile);
            return { width, height };
        } catch (e) {
            Logger.error(`Could not determine Asset dimensions: ` + e);
            return { width: 0, height: 0 };
        }
    }

    private createOrderableAssets(entity: EntityWithAssets, assets: Asset[]): Promise<OrderableAsset[]> {
        const orderableAssets = assets.map((asset, i) => this.getOrderableAsset(entity, asset, i));
        return this.connection.getRepository(orderableAssets[0].constructor).save(orderableAssets);
    }

    private getOrderableAsset(entity: EntityWithAssets, asset: Asset, index: number): OrderableAsset {
        const entityIdProperty = this.getHostEntityIdProperty(entity);
        const orderableAssetType = this.getOrderableAssetType(entity);
        return new orderableAssetType({
            assetId: asset.id,
            position: index,
            [entityIdProperty]: entity.id,
        });
    }

    private async removeExistingOrderableAssets(entity: EntityWithAssets) {
        const propertyName = this.getHostEntityIdProperty(entity);
        const orderableAssetType = this.getOrderableAssetType(entity);
        await this.connection.getRepository(orderableAssetType).delete({
            [propertyName]: entity.id,
        });
    }

    private getOrderableAssetType(entity: EntityWithAssets): Type<OrderableAsset> {
        const assetRelation = this.connection
            .getRepository(entity.constructor)
            .metadata.relations.find(r => r.propertyName === 'assets');
        if (!assetRelation || typeof assetRelation.type === 'string') {
            throw new InternalServerError('error.could-not-find-matching-orderable-asset');
        }
        return assetRelation.type as Type<OrderableAsset>;
    }

    private getHostEntityIdProperty(entity: EntityWithAssets): string {
        const entityName = entity.constructor.name;
        switch (entityName) {
            case 'Product':
                return 'productId';
            case 'ProductVariant':
                return 'productVariantId';
            case 'Collection':
                return 'collectionId';
            default:
                throw new InternalServerError('error.could-not-find-matching-orderable-asset');
        }
    }
}
