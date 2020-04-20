import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  private async calculateBalance(type: string): Promise<number> {
    const transactions = await this.find();

    return transactions
      .filter(transation => transation.type === type)
      .reduce((result, transation) => result + Number(transation.value), 0);
  }

  public async getBalance(): Promise<Balance> {
    const income = await this.calculateBalance('income');
    const outcome = await this.calculateBalance('outcome');
    const total = income - outcome;

    const balance: Balance = { income, outcome, total };

    return balance;
  }
}

export default TransactionsRepository;
