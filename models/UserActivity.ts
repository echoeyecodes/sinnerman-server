import PoolSingleton from '../utils/pool.singleton'
import {DataTypes} from 'sequelize'
import { Model } from 'sequelize'
import User from './User'

const instance = PoolSingleton.getInstance()

class UserActivity extends Model{}

UserActivity.init({
    user_id:{
        type: DataTypes.UUID,
        allowNull: false,
        references:{
            model: User,
            key: 'id'
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },
    last_video_timestamp:{
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0
    },
    last_playlist_timestamp:{
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0
    },
}, {
    sequelize: instance,
    modelName: "user_activity",
    tableName: 'user_activity',
    timestamps:true,
    createdAt: true,
    updatedAt: true
})


export default UserActivity