import {Sequelize} from 'sequelize'

const Pool_singleton = (function(){
    let sequelize: Sequelize
    
    async function getClient(){
        sequelize = new Sequelize({dialect: 'postgres', host: process.env.DB_HOST, port: parseInt(`${process.env.POSTGRES_PORT}`), password: process.env.POSTGRES_PASSWORD, database: process.env.POSTGRES_DB, username: process.env.POSTGRES_USERNAME, logging:false, timezone: '+00:00', dialectOptions:{useUTC:false}})
        try{
            await Promise.all([sequelize.authenticate(), sequelize.sync({alter: true})])
        }catch(error){
            throw new Error(`Couldn't connect to database. Reason: ${error}`)
        }
    }

    return {
        getInstance: function() : Sequelize{
            if(!sequelize){
                getClient()
            }
            return sequelize
        }
    }
}
)()


export default Pool_singleton
