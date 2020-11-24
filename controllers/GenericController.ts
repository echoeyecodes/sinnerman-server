import { BuildOptions, DestroyOptions,SaveOptions, FindOptions, FindOrCreateOptions, Model, ModelCtor, UpdateOptions, CountOptions } from "sequelize/types";

interface GenericFunctions<T> {
  create(params: {}, options?: SaveOptions): Promise<T>,
  updateOne(params: {}, options:UpdateOptions): Promise<undefined>,
  destroy (attributes: DestroyOptions): Promise<number>,
  findOrCreate (params:FindOrCreateOptions) : Promise<[T, boolean]>,
  findAll (attributes: FindOptions) : Promise<T[]>,
  findOne (attributes: FindOptions): Promise<T | null>,
  getCount(countOptions: CountOptions): Promise<number>
}

class GenericController<T, U extends Model> implements GenericFunctions<T> {
  private model!: ModelCtor<U>;

  constructor(key: ModelCtor<U>) {
    this.model = key;
  }


  async updateOne(params : {}, options: UpdateOptions): Promise<undefined> {
      await this.model.update({...params}, {...options});
      return
  }

  async destroy(attributes: DestroyOptions): Promise<number> {
    const value = await this.model.destroy({...attributes});
    return value;
  }

  async findOrCreate(params: FindOrCreateOptions): Promise<[T, boolean]> {
    const [new_model, exists] = await this.model.findOrCreate({...params});

    return [new_model.get(), exists];
  }

  async findAll(attributes: FindOptions): Promise<T[]> {
    const new_model = await this.model.findAll({...attributes});
    return new_model.map((item) => item.get());
  }

  async create(params: {}, options?: SaveOptions): Promise<T> {
    const new_model = this.model.build({...params});
    await new_model.save({...options});
    return new_model.get();
  }

  async findOne(attributes: FindOptions): Promise<T | null> {
    const new_model = await this.model.findOne({...attributes});
    return new_model?.get();
  }

  async getCount(countOptions: CountOptions): Promise<number> {
    const count = await this.model.count(countOptions)
    return count
  }

}

export default GenericController;
