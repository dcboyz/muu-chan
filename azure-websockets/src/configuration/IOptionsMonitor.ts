import dotenv from 'dotenv'

dotenv.config()

export interface IOptionsMonitor<T> {
  currentValue: () => T
}
