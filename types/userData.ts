
export type User = {
  id: string;
  name: string;
};

export type Advisor = {
  id: string;

  user?: {
    name?: string;
  };
};