import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function HomeScreen() {
  const [query, setQuery] = useState('');

  const sendQueryToBackend = async (text: string) => {
    try {
      const response = await fetch('https://yxpvx-106-76-176-222.a.free.pinggy.link/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response from backend:', data);
    } catch (error: any) {
      console.error('Failed to send query to backend:', error.message || error);
      Alert.alert('Error', 'Failed to send query to backend.');
    }
  };

  const handleSubmit = () => {
    if (!query.trim()) {
      Alert.alert('Please enter a query');
      return;
    }

    console.log('User query:', query);
    sendQueryToBackend(query);
    setQuery('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type your query here"
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
        multiline
      />
      <View style={styles.buttonContainer}>
        <Button title="Submit" color="#2962FF" onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#F2F5F9',
  },
  input: {
    height: 140,
    borderColor: '#2962FF',
    borderWidth: 1.5,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    color: '#222222',
    fontSize: 16,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
});
