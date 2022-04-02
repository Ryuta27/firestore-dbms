import React, { useState, useEffect } from "react";

import "./App.css";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  runTransaction,
} from "firebase/firestore";

import { Container } from "@mui/material";
import { TextField } from "@mui/material";
import { Stack } from "@mui/material";
import { Button } from "@mui/material";

const App = () => {
  const [newName, setNewName] = useState("");
  const [newAge, setNewAge] = useState(0);
  const [users, setUsers] = useState([]);

  const usersCollectionRef = collection(db, "users");

  const createUser = async () => {
    const docRef = await addDoc(usersCollectionRef, {
      name: newName,
      age: Number(newAge),
    });
    // console.log("Document written with ID: ", docRef.id);

    setUsers([
      ...users,
      {
        name: newName,
        age: Number(newAge),
        id: docRef.id,
      },
    ]);
    // setNewName("");
    // setNewAge(0);
  };

  const updateUser = async (id, age) => {
    const userDoc = doc(db, "users", id);
    const newFields = { age: age + 1 };
    await updateDoc(userDoc, newFields);
  };

  const deleteUser = async (id) => {
    const userDoc = doc(db, "users", id);
    await deleteDoc(userDoc);
    setUsers(users.filter((user) => user.id !== id));
  };

  // Updata user using transaction
  const updateUserByTransaction = async (id) => {
    await runTransaction(db, async (transaction) => {
      const userDocRef = doc(db, "users", id);
      // Get userDec
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        throw "Document does not exist!";
      }
      const updatedeAge = userDoc.data().age + 1;
      // Update age
      transaction.update(userDocRef, { age: updatedeAge });
      setUsers(
        users.map((user) =>
          user.id == id ? { ...user, age: updatedeAge } : user
        )
      );
    });
    console.log("Transaction successfully committed!");
  };

  useEffect(() => {
    const getUsers = async () => {
      const data = await getDocs(usersCollectionRef);
      setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    getUsers();
  }, []);

  return (
    <Container maxWidth="sm">
      <Stack>
        <TextField
          id="standard-basic"
          label="Name"
          variant="standard"
          onChange={(event) => {
            setNewName(event.target.value);
          }}
        />
        <TextField
          id="standard-basic"
          label="Age"
          variant="standard"
          type="number"
          onChange={(event) => {
            setNewAge(event.target.value);
          }}
        />
        <Button variant="contained" onClick={createUser}>
          Create User
        </Button>

        <ul>
          {users.map((user) => (
            <li key={user.age}>
              {" "}
              Name: {user.name}, Age: {user.age}, Id: {user.id}
              <button
                onClick={() => {
                  // updateUser(user.id, user.age);
                  updateUserByTransaction(user.id);
                }}
              >
                {" "}
                Increase Age
              </button>
              <button
                onClick={() => {
                  deleteUser(user.id);
                }}
              >
                {" "}
                Delete User
              </button>
            </li>
          ))}
        </ul>
      </Stack>
    </Container>
  );
};

export default App;
