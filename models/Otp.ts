import PoolSingleton from '../utils/pool.singleton'
import {DataTypes} from 'sequelize'
import { Model } from 'sequelize'

const instance = PoolSingleton.getInstance()

class Otp extends Model{}

Otp.init({
    id:{
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        unique: true
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    otp:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
}, {
    sequelize: instance,
    modelName: "otp",
    tableName: 'otp',
    timestamps:true,
    createdAt: true,
    updatedAt: true
})

export default Otp