import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  constructor(private dataSource: DataSource) {}

  getHello(): string {
    return 'QuickCart Backend is running!';
  }

  async checkDatabase(): Promise<{ status: string; message: string; details?: any }> {
    try {
      // Perform a simple query to check connection
      await this.dataSource.query('SELECT 1');
      return {
        status: 'up',
        message: 'Database is connected!',
      };
    } catch (error) {
      return {
        status: 'down',
        message: 'Database connection failed',
        details: error.message,
      };
    }
  }
}
