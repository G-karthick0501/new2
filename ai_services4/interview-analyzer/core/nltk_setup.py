# core/nltk_setup.py
import nltk
import os
import sys

def download_nltk_data():
    """Download required NLTK data packages on startup"""
    
    # Define all required packages
    REQUIRED_PACKAGES = [
        'averaged_perceptron_tagger_eng',
        'averaged_perceptron_tagger',
        'punkt',
        'wordnet',
        'stopwords',
        'omw-1.4',
        'vader_lexicon'
    ]
    
    print("🔍 Checking NLTK data packages...")
    
    for package in REQUIRED_PACKAGES:
        try:
            # Try to find the package
            nltk.data.find(f'tokenizers/{package}') if 'punkt' in package else \
            nltk.data.find(f'taggers/{package}') if 'tagger' in package else \
            nltk.data.find(f'corpora/{package}') if package in ['wordnet', 'stopwords', 'omw-1.4'] else \
            nltk.data.find(f'sentiment/{package}')
            
            print(f"✅ {package} already installed")
        except LookupError:
            print(f"📥 Downloading {package}...")
            try:
                nltk.download(package, quiet=False)
                print(f"✅ {package} downloaded successfully")
            except Exception as e:
                print(f"❌ Failed to download {package}: {e}")
                sys.exit(1)
    
    print("✅ All NLTK packages ready!")

if __name__ == "__main__":
    download_nltk_data()