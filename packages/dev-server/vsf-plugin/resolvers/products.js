const { mapObj } = require('./map')
const { handleResponse, handleError } = require('./response')
const { LanguageCode } = require('@vendure/core');

const VISIBILITY_DEF_ROOT = 4
const VISIBILITY_DEF_VARIANT = 1
const TAX_CLASS_ID_DEF = '2'

const ABSTRACT_MOCK = 'This shirt wouldn’t be giant on a Giant, but on you - a regular sized homosapien - it will be a little oversized. But not all over. Just on the width and the armhole, but not the neck or the collars or sleeves or the length - so you’re not like swimming in it. So it just looks a little bit nostalgic. A little bit the future. A little bit rumply. A little bit easy breezy Chambray Denim-y, Japanese Organic Cotton-y. And it feels super soft in a nice year round weight with a twill tape detail at the bottom because…well, just because. Just another silhouette to suit a mood. That is what this is. And in case you hadn’t heard - volume is like so fucking majorsaurus right now.<br>Machine wash it in warm water. Never use bleach. Hang dry it because it\'ll extend the life of the garment and it saves energy. If you need to throw it in the dryer, use a low temperature and make sure you\'ve sized up because even though it\'s been wash tested, it\'s probably going to shrink. Cotton does that. Ironing is fine, iron it high if you want.'
const MIN_SIZE_MOCK = 34
const MAX_SIZE_MOCK = 43
const EDITORIAL_IMAGES_MOCKS = ['/editorial1.png', '/editorial2.png']

// Looks like one of their "products" is a mix of a Vendure Product and ProductVariant, since it includes things like "description" (Product) and price (ProductVariant)
// Oh they have 2 kinds - "simple" and "configurable"
// Simple looks like a Vendure Product with only 1 ProductVariant.
// That part looks totally doable, I think all the data is there, just needs arranging right.

// IGNORATI: apparel_type



const getFeatured = ({featuredAsset}) => featuredAsset && {id: featuredAsset.id, image: `/${featuredAsset.source}`}

const getImage = ({featuredAsset}) => featuredAsset && `/${featuredAsset.source}`
const getMediaGallery = ({assets}) => assets && assets.map(({id, source}) => ({id, image: `/${source}`}))

const getOption = optName => optGroups => {
    const optId = optGroups.find(opt => opt.name === optName).id
    return ({options}) => {
        const opt = options.find(opt => opt.groupId === optId)
        return opt && opt.id
    }
}

// const getSize = getOption('size')
const getColor = getOption('color')

const VARIANT_MAP = (options, parent_id) => ({
    __statics: {
        parent_id,
        status: 1,
        visibility: VISIBILITY_DEF_VARIANT,
        tax_class_id: TAX_CLASS_ID_DEF,
        is_in_stock: true,
        stock: {
            is_in_stock: true
        },
//         Collections are a distinct concept from facets. They are related though, since a Collection can define facets with which to include matching ProductVariants.
// Thinking about the above example further, it could actually map to ProductOptionGroup.name: ProductOption.id
// It depends whether "color", "size" etc. actually relate to the unique options of a given variant.
        length: null, // TBD?
        meta_keyword: null, // TBD?
        gift_message_available: null, // TBD?
        gift_wrapping_available: 0, // TBD?
        special_price: null, // TBD?
        special_from_date: null, // TBD?
        special_to_date: null, // TBD?
        url_key: null, // TBD?
        url_path: null // TBD?
    },
    __transform: {
        // configurable_children: ({variants}) => variants.map(mapVariant),
        // size: getSize(options),
        color: getColor(options),
        price: ({priceWithTax}) => priceWithTax/100,
        final_price: ({priceWithTax}) => priceWithTax/100,
        image: getImage,
        media_gallery: getMediaGallery
    },
    __copy: {
        slug: ['url_key', 'url_path']
    },
    'id': 'id',
    'name': 'name',
    'sku': 'sku',
    'createdAt': 'createdAt',
    'updatedAt': 'updatedAt'
})

const OPTION_VALUE_MAP = groupId => ({
    __statics: {
        product_super_attribute_id: groupId,
        is_percent: 0,
        // order: 34, // TBD?
        pricing_value: null,
        use_default_value: true
    },
    __copy: {
        name: ['label', 'default_label', 'store_label']
    },
    'id': 'value_index'
})

const OPTIONS_MAP = (options, attributes) => ({
    __statics: {
        use_default: 0
    },
    __transform: {
        // FILTER ALL OPTIONS BY OPTIONSGROUP ID + MAP
        position: (optGroup, index) => index,
        values: ({id}) => options.filter(opt => opt.groupId === id)
            .map(mapObj(OPTION_VALUE_MAP(id))),
        attribute_id: ({name}) => attributes.find(att => att.code === name).id
    },
    __copy: {
        name: ['label', 'frontend_label', 'store_label', 'attribute_code']
    },
    'id': 'id'
})

/**
 * 
 * this extract properties of default VSF variant from the general product props + 
 * the first variant defined
 * 
 * @param {*} product 
 * @param {*} defVariant 
 */
const mergeDefaultVariant = (product, defVariant, multiVariant) => {

    // remove parent_id
    // createdAt, updatedAt della defVariant, 
    // color, size dalla options
    
    const merged = {
        ...defVariant,
        status: 1,
        tax_class_id: TAX_CLASS_ID_DEF,
        visibility: VISIBILITY_DEF_ROOT,
        type_id: multiVariant ? 'configurable' : 'simple',
        name: product.name,
        description: product.description,
        short_description: product.description,
        product_id: product.id,
        parent_id: null,
        abstract: ABSTRACT_MOCK,
        editorial_images: EDITORIAL_IMAGES_MOCKS,
        min_size: MIN_SIZE_MOCK,
        max_size: MAX_SIZE_MOCK,
        ...(multiVariant ? {
            color: null,
            // size: null
        } : {})
        // ...mapRootProd(product)
    }
    const images = [getFeatured(product), getFeatured(defVariant), ...getMediaGallery(product), ...merged.media_gallery]
        .filter(v => !!v)

    const img = images.shift()
    merged.image = img ? img.image : undefined
    merged.media_gallery = images
    return merged
}

const getCategories = (collections, facetValues) => {
    return facetValues.filter(val => val.facet.code === 'category')
        .map(val => collections.find(c => val.name === c.name))
        .map(({id, name}) => ({category_id: id, name}))
}

const getAllOptionsFromVariants = variants => variants
    .reduce((acc, v) => {
        v.options.forEach(opt => {
            if(!acc.find(o => o.id === opt.id)) {
                acc.push(opt)
            }
        })
        return acc
    }, [])

const getIdsFromOptions = (optName, options) => options.find(opt => opt.label === optName)
    .values.map(v => v.value_index)

const mapProduct = (options, collections, attributes) => product => {
    const mapVariant = mapObj(VARIANT_MAP(options, product.id))
    const { variants } = product
    const multiVariant = variants.length > 1
    const prod = mergeDefaultVariant(product, mapVariant(variants[0]), multiVariant)
    const categories = getCategories(collections, product.facetValues)
    if (categories.length) {
        prod.category = categories
        prod.category_ids = categories.map(c => c.category_id)
    }
    if (multiVariant) {
        prod.configurable_children = variants.map(mapVariant)
        const allOptions = getAllOptionsFromVariants(product.variants)
        const mapOptions = mapObj(OPTIONS_MAP(allOptions, attributes))
        prod.configurable_options = options.map(mapOptions)
        prod.color_options = getIdsFromOptions('color', prod.configurable_options)
        // prod.size_options = getIdsFromOptions('size', prod.configurable_options)
    } 
    return prod
}

module.exports.getProducts = async (productService, variantService, productOptionGroupService, collectionService, facetService, ctx) => {
    console.warn('get products')
    const products = (await productService.findAll(ctx)).items
    const options = await productOptionGroupService.findAll(ctx)
    const collections = (await collectionService.findAll(ctx)).items
    const attributes = (await facetService.findAll(LanguageCode.it)).items
    return Promise.all(products.map(async p => {
        p.variants = await variantService.getVariantsByProductId(ctx, p.id).then(v => p.variants = v)
    })).then(() => products.map(mapProduct(options, collections, attributes)))
    .then(handleResponse)
    .catch(handleError)
}

