import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity,
  StyleSheet, Text, FlatList,
  KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MicrophoneRec from "@/components/mic" // Adjust correct path

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ id: string; text: string; sender: 'user' | 'bot' }[]>([]);

  const sendQueryToBackend = async (text: string) => {
    try {
      const resp = await fetch('https://lfect-106-76-188-190.a.free.pinggy.link/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      const data = await resp.json();
      const botReply = (data.response || JSON.stringify(data))
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      setMessages(prev => [...prev, {
        id: `${Date.now()}_bot`,
        text: botReply,
        sender: 'bot'
      }]);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'Failed to send query.');
    }
  };

  const handleSubmit = () => {
    if (!query.trim()) return Alert.alert('Please enter a query');
    const msg: { id: string; text: string; sender: 'user' | 'bot' } = { id: `${Date.now()}`, text: query, sender: 'user' };
    setMessages(prev => [...prev, msg]);
    sendQueryToBackend(query);
    setQuery('');
  };

  const onRecordingComplete = (uri: string) => {
    setMessages(prev => [...prev, {
      id: `${Date.now()}_voice`,
      text: `🎤 Voice message: ${uri}`,
      sender: 'user'
    }]);
  };

  const renderMessage = ({ item }: { item: { id: string; text: string; sender: 'user' | 'bot' } }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          multiline
        />
        <MicrophoneRec onRecordingComplete={onRecordingComplete} />
        <TouchableOpacity style={styles.sendButton} onPress={handleSubmit}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ECE5DD' },
  chatContainer: { padding: 10 },
  messageBubble: { maxWidth: '75%', padding: 10, borderRadius: 20, marginVertical: 4 },
  userBubble: { backgroundColor: '#8cd6e2', alignSelf: 'flex-end', borderBottomRightRadius: 0 },
  botBubble: { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 0 },
  messageText: { fontSize: 15, color: '#000' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 6, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd' },
  input: { flex: 1, minHeight: 40, maxHeight: 120, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#f0f0f0', fontSize: 15, marginRight: 8 },
  sendButton: { backgroundColor: '#1728b9', borderRadius: 25, width: 50, height: 50, justifyContent: 'center', alignItems: 'center' },
});
