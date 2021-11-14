export interface NewRoom {
  name: string;
  questions: string[];
  ownerToken: string;
}

export interface APIResponse {
  error?: string;
}

export interface NewRoomResponse extends APIResponse {
  code: string
}

export interface MyRoomListResponse extends APIResponse {
  rooms: {
    id: number
    code: string;
    name: string;
  }[];
}

export interface GetRoomResponse extends APIResponse {
  room: {
    name: string;
    questions: {
      question: string;
      responses: string[];
    }[];
  };
}
