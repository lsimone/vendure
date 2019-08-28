const { handleResponse, handleError } = require('./response')
const map = require('object-mapper')

const CATEGORY_MAP = {
    'id': 'id', 
    'createdAt': 'createdAt', 
    'updatedAt': 'updatedAt', 
    'position': 'position', 
    'name': 'name', 
    'children_data': 'children_data',
    // level: compute from tree
    // children_count: compute from tree
    // children_data: compute from tree
    // is_active: true
    // is_anchor: true
    // request_path: mocked => TBD
    // url_key: mocked => TBD
    'parent.id': 'parent_id'
}

const mappedList = {}

const decorateWithTreeData = (node, level = 0) => {
    node.level = level
    if (!node.children_data) {
        node.children_count = 0
    } else {
        node.children_count = node.children_data.length
        node.children_data.forEach(n => decorateWithTreeData(n, level + 1))
    }
}

const addChild = (parent, child) => {
    if (!parent.children_data) {
        parent.children_data = []
    }
    parent.children_data.push(child)
}

const getRoot = categories => categories.find(cat => cat.parent.isRoot).parent

const mapAndLinkCategory = items => category => {
    // FROM:
    
    // id: 4,
    // createdAt: "2019-08-13T15:33:40.000Z",
    // updatedAt: "2019-08-13T15:33:40.000Z",
    // isRoot: false,
    // position: 2,
    // isPrivate: false,   
    // languageCode: "en",
    // name: "Camera & Photo",
    // description: ""

    // TO:
    // "parent_id": 2,
    // "created_at": "2013-01-25 10:43:31",
    // "updated_at": "2013-05-15 22:50:23",
    // "position": 2,
    // "level": 2,
    // "children_count": 4,
    // "request_path": "women.html",
    // "is_active": true,
    // "name": "Women",
    // "url_key": "women",
    // "is_anchor": true,
    // "id": 4,
    // "children_data": [
    
    const found = mappedList[category.id]
    if (found) {
        return found
    }
    const mapped = map(category, CATEGORY_MAP)
    mappedList[mapped.id] = mapped
    if (category.parent) {
        const parent = mappedList[category.parent.id] || mapAndLinkCategory(items)(items.find(c => c.id === category.parent.id))
        addChild(parent, mapped)    
    }
    return mapped
}

module.exports.getCategories = (ctx, collectionService) => {
    return collectionService.findAll(ctx)
        .then(({items}) => {
            const root = mapAndLinkCategory(items)(getRoot(items))
    
            items.forEach(mapAndLinkCategory([root, ...items]))
        
            decorateWithTreeData(root)
            return [root]
        })
        .then(handleResponse)
        .catch(handleError)
}
