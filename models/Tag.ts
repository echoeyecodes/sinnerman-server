import PoolSingleton from '../utils/pool.singleton'
import {DataTypes} from 'sequelize'
import { Model } from 'sequelize'

const instance = PoolSingleton.getInstance()

class Tag extends Model{}

Tag.init({
    id:{
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize: instance,
    modelName: "tags",
    tableName: 'tags',
    timestamps:true,
    createdAt: true,
    updatedAt: true
})

export default Tag