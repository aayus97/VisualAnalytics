import matplotlib.pyplot as plt
from collections import Counter
import pandas as pd

# Load the dataset
file_path = 'dataset.csv'  # Replace with your file path
data = pd.read_csv(file_path)

# Average time spent visualization
avg_time_spent = 5.14  # Provided statistic
max_time = 24  # Benchmark (24 hours/day)

plt.figure(figsize=(8, 5))
plt.bar(['Avg Time on Social Media', 'Remaining Time'], 
        [avg_time_spent, max_time - avg_time_spent], 
        color=['blue', 'gray'], edgecolor='black')
plt.title('Average Time Spent on Social Media')
plt.ylabel('Hours')
plt.xticks(rotation=0)
plt.show()

# Top 10 most frequent words
all_words = data[['Word_1', 'Word_2', 'Word_3', 'Word_4', 'Word_5', 'Word_6', 'Word_7', 'Word_8', 'Word_9', 'Word_10']].values.flatten()
word_counts = Counter(all_words)
most_common_words = word_counts.most_common(10)

# Word Frequency Visualization
words, counts = zip(*most_common_words)
plt.figure(figsize=(10, 6))
plt.bar(words, counts, color='orange', edgecolor='black')
plt.title('Top 10 Most Frequent Words')
plt.xlabel('Words')
plt.ylabel('Frequency')
plt.xticks(rotation=45)
plt.show()

# Sentiment association with words
positive_words = []
negative_words = []

for _, row in data.iterrows():
    words = [row[f'Word_{i}'] for i in range(1, 11)]
    if row['sentiment'] > 0:
        positive_words.extend(words)
    else:
        negative_words.extend(words)

positive_word_counts = Counter(positive_words).most_common(10)
negative_word_counts = Counter(negative_words).most_common(10)

# Positive Sentiment Words
words, counts = zip(*positive_word_counts)
plt.figure(figsize=(10, 6))
plt.bar(words, counts, color='green', edgecolor='black')
plt.title('Top 10 Words in Positive Sentiment Posts')
plt.xlabel('Words')
plt.ylabel('Frequency')
plt.xticks(rotation=45)
plt.show()

# Negative Sentiment Words
words, counts = zip(*negative_word_counts)
plt.figure(figsize=(10, 6))
plt.bar(words, counts, color='red', edgecolor='black')
plt.title('Top 10 Words in Negative Sentiment Posts')
plt.xlabel('Words')
plt.ylabel('Frequency')
plt.xticks(rotation=45)
plt.show()

# Print interesting statistics
print("Interesting Insights:")
print(f"- Students spend an average of {avg_time_spent} hours on social media daily.")
print("- Top 10 most common words:", most_common_words)
print("- Top 10 words in positive sentiment posts:", positive_word_counts)
print("- Top 10 words in negative sentiment posts:", negative_word_counts)
