import mongoose from "mongoose";
type ConnectionObject={
  isConnected?:number
}
const connection:ConnectionObject={

}
async function dbconnect():Promise<void> {
  if(connection.isConnected){
    console.log("Alredy connected to database")
    return
  }
  try{
    const db=await mongoose.connect(process.env.MANGODB_URI ||'',{})
    connection.isConnected=db.connections[0].readyState
    console.log("db connnected succesfully")
  }catch(error){
    console.log("database connection failed",error);
    process.exit(1);

  }
}
export default dbconnect;