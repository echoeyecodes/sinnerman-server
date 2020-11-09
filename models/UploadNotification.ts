import PoolSingleton from '../utils/pool.singleton'
import {DataTypes} from 'sequelize'
import { Model } from 'sequelize'

const instance = PoolSingleton.getInstance()

class UploadNotification extends Model{}

UploadNotification.init({
    id:{
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    },
    is_read:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false      
    },
    thumbnail:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    video_id:{
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: instance,
    modelName: "upload_notifications",
    tableName: 'upload_notifications',
    timestamps:true,
    createdAt: true,
    updatedAt: true
})
export default UploadNotification