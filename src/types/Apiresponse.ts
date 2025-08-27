import { Message } from "@/Modal/users";
export interface Apiresponse{
  success:boolean;
  message:string;
  isAcceptingMessage?:boolean;
  messages?:Array<Message>
}