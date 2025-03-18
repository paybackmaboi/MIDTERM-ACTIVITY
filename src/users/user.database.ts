import { AppDataSource } from "../database/db";
import { User } from "../entities/user.entity";

export const findAll = async () => {
  const userRepository = AppDataSource.getRepository(User);
  return await userRepository.find();
};

export const findOne = async (id: string) => {
  const userRepository = AppDataSource.getRepository(User);
  return await userRepository.findOneBy({ id });
};

export const findByEmail = async (email: string) => {
  const userRepository = AppDataSource.getRepository(User);
  return await userRepository.findOneBy({ email });
};

export const create = async (userData: { username: string, email: string, password: string }) => {
  const userRepository = AppDataSource.getRepository(User);
  const newUser = userRepository.create(userData);
  return await userRepository.save(newUser);
};

export const update = async (id: string, userData: { username: string, email: string, password: string }) => {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOneBy({ id });
  if (user) {
    user.username = userData.username;
    user.email = userData.email;
    user.password = userData.password;
    return await userRepository.save(user);
  }
  return null;
};

export const remove = async (id: string) => {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOneBy({ id });
  if (user) {
    return await userRepository.remove(user);
  }
  return null;
};