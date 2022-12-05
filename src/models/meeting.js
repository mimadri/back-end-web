const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class meeting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.user, {
        as: 'userBuyer',
        foreignKey: 'buyerId',
      });
      this.belongsTo(models.user, {
        as: 'userSeller',
        foreignKey: 'sellerId',
      });
      this.belongsTo(models.property, {
        as: 'property',
        foreignKey: 'propertyId',
      });
    }
  }
  meeting.init({
    buyerId: DataTypes.INTEGER,
    sellerId: DataTypes.INTEGER,
    propertyId: DataTypes.INTEGER,
    date: DataTypes.DATEONLY,
    hour: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'meeting',
  });
  return meeting;
};
