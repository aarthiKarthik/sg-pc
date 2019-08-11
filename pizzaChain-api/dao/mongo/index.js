let procurement = require('../../model/procurementModel')

let modelsObj = {
    PROCUREMENT: procurement
}

const saveData = async (modelName, data) => {
    try {
        let model = modelsObj[modelName]
        let modelInstance = new model(data);
        let successData = await modelInstance.save();
        return Promise.resolve(successData)
    } catch (e) {
        return Promise.reject(e)
    }
}

const getData = async (modelName, query) => {
    try {
        let model = modelsObj[modelName]
        let data = await model.find(query)
        console.log("data = "+data[0]);
        return Promise.resolve(data)
    } catch (e) {
        return Promise.reject(e)
    }
}

const getListData = async (modelName, query, page) => {
    try {
        let model = modelsObj[modelName]
        let data = await model.find(query).skip(page.index * page.size).limit(page.size).exec()
        return Promise.resolve(data)
    } catch (e) {
        return Promise.reject(e)
    }
}

const updateData = async (modelName, condition, updateData) => {
    try {
        let model = modelsObj[modelName]
        let data = await model.update(condition, updateData)
        return Promise.resolve(data)
    } catch (e) {
        return Promise.reject(e)
    }
}

module.exports.saveData = saveData
module.exports.getData = getData
module.exports.updateData = updateData
module.exports.getListData = getListData