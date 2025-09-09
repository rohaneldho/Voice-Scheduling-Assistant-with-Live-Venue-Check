import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
} from 'expo-audio';

interface Props {
  onRecordingComplete?: (uri: string) => void;
}

export default function MicrophoneRec({ onRecordingComplete }: Props) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        alert('Permission to access microphone was denied');
      }
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  const startRecording = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    await audioRecorder.stop();
    const uri = audioRecorder.uri;
    setIsRecording(false);
    if (uri && onRecordingComplete) onRecordingComplete(uri);
  };

  return (
    <TouchableOpacity
      style={[styles.micButton, isRecording && styles.micActive]}
      onPress={isRecording ? stopRecording : startRecording}
    >
      <Ionicons name={isRecording ? 'stop' : 'mic'} size={24} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  micButton: {
    backgroundColor: '#25D366',
    borderRadius: 25,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  micActive: {
    backgroundColor: '#FF4D4D',
  },
});
