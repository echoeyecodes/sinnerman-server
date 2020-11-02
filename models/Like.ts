import PoolSingleton from '../utils/pool.singleton'
import {DataTypes} from 'sequelize'
import { Model } from 'sequelize'

const instance = PoolSingleton.getInstance()

class Like extends Model{}

Like.init({
    id:{
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    },
    user_id:{
        type: DataTypes.UUID,
        allowNull: false,
    },
    video_id:{
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: instance,
    modelName: "likes",
    tableName: 'likes',
    timestamps:true,
    createdAt: true,
    updatedAt: true
})

export default Like