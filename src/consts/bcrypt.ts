import * as bcrypt from 'bcrypt';

export const saltRounds = 12;

export const getDefaultPassword = async () => {
  const salt = await bcrypt.genSalt(saltRounds);
  const encriptedPassoword = await bcrypt.hash('1234', salt);
  return encriptedPassoword;
};

export const encryptPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const encriptedPassoword = await bcrypt.hash(password, salt);
  return encriptedPassoword;
};
