import os
from api.ai import askSummary
import requests
import time
from urllib.parse import quote
import requests
import tweepy
# Twitter API credentials
CONSUMER_KEY = 'yfJAXjE5Xzj5b7mEz0d3C37Us'
CONSUMER_SECRET = 'noqNpnEji30Z4XdhG3b51YpkklYYmp12WqvsRpkPzUDi33xf29'
ACCESS_TOKEN = '1765336436838985728-eeirCQxzt5h04BidXJ6U4XDTTAjp1J'
ACCESS_TOKEN_SECRET = 'y1PSSdqT2is9HXzFOlXzrQLF8CK5bFHsZvSPoQXBkGRt0'

# Authenticate to Twitter
auth = tweepy.OAuthHandler(
    CONSUMER_KEY, CONSUMER_SECRET
)
auth.set_access_token(ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

api = tweepy.API(auth)

def find_thread_starter(tweet_id):
    print(f"Tweet ${tweet_id}", flush=True)
    tweet = api.get_status(tweet_id)
    parent_tweet_id = tweet.in_reply_to_status_id

    if parent_tweet_id is None:
        return tweet  # This is the thread starter
    else:
        return find_thread_starter(parent_tweet_id)  # Recursively find the thread starter


def processConversation(tweet):
    try:
        print(f"Processing tweet {tweet.id}", flush=True)
        thread_starter = find_thread_starter(tweet.id)
        print(f"Found thread starter ${thread_starter.id}", flush=True)
        return processTweet(thread_starter.content)
    except Exception as e:
        print(f"Error calling ai for conv: {str(e)}", flush=True)
        return None
    
def processTweet(content):
    try:
        summary = askSummary(content)
        print("Output", summary, flush=True)
        encoded_string = quote(summary)
        baseUrl = os.environ.get("NEXT_PUBLIC_VERCEL_URL") or "http://localhost:3000"
        return f"Here I am! You can find '{summary}' explanation here {baseUrl}?q={encoded_string}"
    except Exception as e:
        print(f"Error calling ai for tweet: {str(e)}", flush=True)
        return None

# Function to tweet the API response
def tweet_response(tweet):
    answer = processTweet(tweet)
    if answer:
        api.update_status(f"@{api.me().screen_name} {answer}", in_reply_to_status_id=tweet.id)
        print("Tweeted successfully")
    else:
        print("Failed to retrieve API response")

# Stream listener class
class MyStream(tweepy.Stream):
    def on_status(self, status):
        print(f"Received tweet: {status.text}")
        tweet_id = status.id
        tweet_response(tweet_id)

    def on_error(self, status_code):
        print(f"Encountered streaming error with status code: {status_code}")
        return True  # To continue streaming

# Main function
def main():
    my_stream = MyStream(auth=api.auth)
    my_stream.filter(track=[f"@{api.me().screen_name}"], is_async=True)
