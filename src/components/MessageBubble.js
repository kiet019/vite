import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const MessageBubble = ({ message, isUser, fontSize = 1 }) => {
  const { theme } = useTheme();

  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.botContainer,
      { alignSelf: isUser ? 'flex-end' : 'flex-start' }
    ]}>
      <View style={[
        styles.bubble,
        isUser 
          ? [styles.userBubble, { backgroundColor: theme.userMessage }] 
          : [styles.botBubble, { backgroundColor: theme.botMessage }],
      ]}>
        <Text style={[
          styles.messageText,
          { 
            color: theme.text,
            fontSize: 16 * fontSize // Apply font size scaling
          }
        ]}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  userContainer: {
    marginLeft: 40,
  },
  botContainer: {
    marginRight: 40,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  botBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    lineHeight: 22,
  },
});

export default MessageBubble;
