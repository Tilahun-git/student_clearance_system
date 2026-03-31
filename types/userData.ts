
export type User = {
  id: string;
  name: string;
};

export type Advisor = {
  id: string;
  name: string;
  user:User ;
};