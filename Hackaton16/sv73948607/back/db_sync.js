const sequelize =require('./db')

module.exports =async function syncDb(){
    const strategy=process.env.DB_SYNC
    const options={logging:false}
    if (strategy === 'alter') options.alter = true;
    if (strategy === 'force') options.force = true;

    console.log('[sync] strategy =', strategy);
    await sequelize.sync(options);
}   