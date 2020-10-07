import { Model, ModelCtor } from "sequelize/types";

interface GenericFunctions<T> {
  create(params: {}): Promise<T>;

  findOrCreate(params: {}, defaults: {}): Promise<[T, boolean]>;

  findOneByAttributes(attributes: {}): Promise<T | null>;

  updateOneByAttributes(payload : {}, attributes: {}): Promise<undefined>;

  findAll(): Promise<T[]>;

  findAllByFilter(filter:{}): Promise<T[]>;

  findAllByAttributes(attributes: {}): Promise<T[]>;

  destroy(attributes: {}): Promise<number>;

  findAllByPagination(variables: {
    offset: number;
    limit: number;
  }): Promise<T[]>;

  findAllByPaginationFilter(
    variables: {
      offset: number;
      limit: number;
      where: {};
    }
  ): Promise<T[]>;
}

class GenericController<T, U extends Model> implements GenericFunctions<T> {
  private model!: ModelCtor<U>;

  constructor(key: ModelCtor<U>) {
    this.model = key;
  }


  async updateOneByAttributes(payload : {}, attributes: {}): Promise<undefined> {
      await this.model.update(payload, { where: attributes });
      return
  }


  async findAllByFilter(filter: {}): Promise<T[]> {
    const new_model = await this.model.findAll({where: filter});
    return new_model.map((item) => item.get());
  }

  async findAllByPaginationFilter(
    variables: { offset: number; limit: number; where: {} }
  ): Promise<T[]> {
    const new_model = await this.model.findAll(variables);
    return new_model.map((item) => item.get());
  }

  async destroy(attributes: {}): Promise<number> {
    const value = await this.model.destroy({ where: attributes });
    return value;
  }

  async findOrCreate(params: {}, defaults: {}): Promise<[T, boolean]> {
    const [new_model, exists] = await this.model.findOrCreate({
      where: params,
      defaults: defaults,
    });

    return [new_model.get(), exists];
  }

  async findAllByAttributes(attributes: {}): Promise<T[]> {
    const new_model = await this.model.findAll({ where: attributes });
    return new_model.map((item) => item.get());
  }

  async findAllByPagination(variables: {
    offset: number;
    limit: number;
  }): Promise<T[]> {
    const new_model = await this.model.findAll(variables);
    return new_model.map((item) => item.get());
  }

  async create(params: {}): Promise<T> {
    const new_model = this.model.build(params);
    await new_model.save();
    return new_model.get();
  }

  async findOneByAttributes(attributes: {}): Promise<T | null> {
    const new_model = await this.model.findOne({ where: attributes });
    return new_model?.get();
  }

  async findAll(): Promise<T[]> {
    const new_model = await this.model.findAll();
    return new_model.map((item) => item.get());
  }
}

export default GenericController;
