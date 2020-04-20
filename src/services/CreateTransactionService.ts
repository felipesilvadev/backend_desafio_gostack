import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError(
        'Cannot create outcome transaction without a valid balance',
      );
    }

    const categoriesRepository = getRepository(Category);

    let categoryFind = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryFind) {
      categoryFind = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(categoryFind);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: categoryFind.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
