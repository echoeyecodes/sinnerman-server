import PoolSingleton from '../utils/pool.singleton'
import {DataTypes} from 'sequelize'
import { Model } from 'sequelize'

const instance = PoolSingleton.getInstance()

class View extends Model{}

View.init({
    id:{
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    }
}, {
    sequelize: instance,
    modelName: "views",
    tableName: 'views',
    timestamps:true,
    createdAt: true,
    updatedAt: true
})

export default View