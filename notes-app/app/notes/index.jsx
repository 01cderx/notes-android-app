import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  // ActivityIndicator,
} from "react-native";
import NoteList from "../../components/NoteList";
import AddNoteModal from "@/components/AddNoteModal";
import noteService from "@/services/noteService";
import { ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/authContext";


const NoteScreen = () => {
  const router = useRouter();
  const {user, loading: authLoading} = useAuth();
  const [notes, setNotes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth')
    }
  },[user, authLoading])

  
useEffect(() => {
  if (!authLoading && user) {
    fetChNotes();
  }
}, [user, authLoading]);

  const fetChNotes = async () => {
    setLoading(true);
    const response = await noteService.getNotes();
    if (response.error) {
      setError(response.error);
      Alert.alert('Error', response.error)
    } else {
      setNotes(response.data)
      setError(null);
    }
    setLoading(false);
  }
//   Add a new note
  const addNote = async () => {
    if (typeof newNote !== 'string' ||  newNote.trim() === "") {
        return;
    }
    const response = await noteService.addNote(newNote);
    if (response.error) {
      Alert.alert('Error', response.error);
    } else {
      setNotes([...notes, response.data])
    }
   
    setNewNote('');
    setModalVisible(false);
  }

  // update a note
  const editNote = async (id, newText) => {
    if (!newText.trim()) {
      Alert.alert('Error', 'Note text cannot be empty')
      return;
    }
    const response = await noteService.updateNote(id, newText);
    if (response.error) {
      Alert.alert('Error', response.error);
      
    } else {
      setNotes((prevNotes) => prevNotes.map((note) => note._id === id ? {...note, text: response.data.text} : note))
    }
  }

  // Delete a note
const deleteNote = async (id) => {
  const performDelete = async () => {
    try {
      console.log("Deleting note:", id);

      const response = await noteService.deleteNote(id);

      console.log("DELETE RESPONSE:", response);

      if (response?.error) {
        Alert.alert("Error", response.error);
        return;
      }

      // Use functional state update to avoid stale `notes`
      setNotes((prevNotes) =>
        prevNotes.filter((note) => note._id !== id)
      );

      console.log("Note deleted successfully:", id);
    } catch (error) {
      console.error("Delete note error:", error);

      Alert.alert(
        "Error",
        error?.message || "Failed to delete note"
      );
    }
  };

  // Expo Web
  if (Platform.OS === "web") {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (confirmed) {
      await performDelete();
    }

    return;
  }

  // Android / iOS
  Alert.alert(
    "Delete Note",
    "Are you sure you want to delete this note?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: performDelete,
      },
    ]
  );
};

  return (
   <View style={styles.container}>
  {/* Note List */}
  {loading ? (
    <ActivityIndicator size='large' color='#007bff' />
  ) : (
    <>
    {error && <Text style={styles.errorText}>{error}</Text> }
    {notes.length === 0 ? (
      <Text style={styles.noNotesText} >You don't have notes</Text>
    ) : (

      <NoteList notes={notes} onDelete={deleteNote} onEdit={editNote} />
    ) }

    </>
  )} 

  <TouchableOpacity
    style={styles.addButton}
    onPress={() => setModalVisible(true)}
  >
    <Text style={styles.addButtonText}>+ Add Note</Text>
  </TouchableOpacity>

  <AddNoteModal 
    modalVisible={modalVisible}
    setModalVisible={setModalVisible}
    newNote={newNote}
    setNewNote={setNewNote}
    addNote={addNote}
  />
</View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  }, errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 16
  }, noNotesText : {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 15,
     
  }
});

export default NoteScreen;
