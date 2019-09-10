import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';

describe('User Entity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.password = 'testPassword';
    user.salt = 'testSalt';
    (bcrypt as any).hash = jest.fn();
  });

  describe('validatePassword', () => {
    it('returns true as password is valid', async () => {
      (bcrypt.hash as any).mockResolvedValue('testPassword');
      const result = await user.validatePassword('12345');
      expect(bcrypt.hash).toHaveBeenCalledWith('12345', 'testSalt');
      expect(result).toEqual(true);
    });

    it('resurns false as password is inValid', async () => {
      (bcrypt.hash as any).mockResolvedValue('inValid');
      const result = await user.validatePassword('12345');
      expect(result).toEqual(false);
    });
  });
});
