import os
import sys
import asyncio

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.services.assessment import REFERENCE_LETTERS, REFERENCE_WORDS, AssessmentEngine

def main():
    print("Verifying template loading...")
    
    # Check Reference Letters
    letters_count = len(REFERENCE_LETTERS)
    print(f"Loaded {letters_count} letters from reference_letters.json.")
    assert letters_count > 0, "No letters loaded!"
    
    # Check Reference Words
    words_count = len(REFERENCE_WORDS)
    print(f"Loaded {words_count} words from reference_words.json.")
    assert words_count > 0, "No words loaded!"
    
    # Test checking sign type
    is_a_static = asyncio.run(AssessmentEngine.check_sign_type_static("sign_A"))
    print(f"Is 'sign_A' static? {is_a_static}")
    assert is_a_static is True, "sign_A should be static!"
    
    is_drink_static = asyncio.run(AssessmentEngine.check_sign_type_static("sign_drink"))
    print(f"Is 'sign_drink' static? {is_drink_static}")
    assert is_drink_static is False, "sign_drink should be dynamic!"
    
    # Test loading reference landmarks
    ref_a = asyncio.run(AssessmentEngine.get_reference_landmarks("sign_A"))
    print(f"Reference A shape: {ref_a.shape if ref_a is not None else 'None'}")
    assert ref_a is not None, "Reference A landmarks should be loaded!"
    assert ref_a.shape == (21, 3), "Reference A shape should be (21, 3)"
    
    # Test loading reference sequence
    ref_drink = asyncio.run(AssessmentEngine.get_reference_sequence("sign_drink"))
    print(f"Reference drink sequence length: {len(ref_drink) if ref_drink is not None else 'None'}")
    assert ref_drink is not None, "Reference drink sequence should be loaded!"
    assert len(ref_drink) > 0, "Reference drink sequence should have frames!"
    assert ref_drink[0].shape == (63,), "Reference drink sequence frame shape should be (63,)"
    
    print("\nTemplate verification PASSED successfully!")

if __name__ == "__main__":
    main()
