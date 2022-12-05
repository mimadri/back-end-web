const {
  Model,
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.property);
      this.hasMany(models.meeting, {
        as: 'meetingBuyer',
        foreignKey: 'buyerId',
      });
      this.hasMany(models.meeting, {
        as: 'meetingSeller',
        foreignKey: 'sellerId',
      });
      this.hasMany(models.Comment);
      this.hasMany(models.report);
    }
  }
  user.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'user',
  });
  return user;
};
