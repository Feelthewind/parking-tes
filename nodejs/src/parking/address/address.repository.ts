import { EntityRepository, Repository } from 'typeorm';
import { IAddress } from '../interface/address.interface';
import { Address } from './address.entity';

@EntityRepository(Address)
export class AddressRepository extends Repository<Address> {
  async createAddress(data: IAddress): Promise<Address> {
    const address = this.create();
    address.address1 = data.address1;
    address.address2 = data.address2;
    address.address3 = data.address3;
    address.city = data.city;
    address.postalCode = data.postalCode;
    address.state = data.state;
    return address.save();
  }
}
