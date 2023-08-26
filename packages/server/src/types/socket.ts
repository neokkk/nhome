export type Message<T> = {
  __type: string;
} & T;
