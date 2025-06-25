import yaml
from pathlib import Path
from threading import Lock
from typing import Any
import logging
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
from io import BytesIO

# INITIALIZE LOGGER
logger = logging.getLogger(__name__)

# CACHE MANAGER CLASS
class CacheManager:
    _instance = None
    _lock = Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super().__new__(cls)
                cls._instance._cache = {}
            return cls._instance
    
    def set(self, key: str, value: Any) -> None:
        """SET A VARIABLE IN THE CACHE"""
        self._cache[key] = value
        logger.info(f"---{key} ADDED IN CACHE---")
    
    def get(self, key: str, default = None) -> Any:
        """GET A VARIABLE FROM THE CACHE"""
        logger.info(f"---GETTING {key} FROM CACHE---")
        return self._cache.get(key, default)

    def has(self, key: str) -> bool:
        """CHECK IF A VARIABLE EXISTS IN THE CACHE"""
        return key in self._cache
    
    def clear(self, key: str = None) -> None:
        """CLEAR A CATEGORY FROM THE CACHE"""
        if key:
            self._cache.pop(key, None)
            logger.info(f"---{key} CLEARED FROM CACHE---")
        else:
            self._cache = {}
            print(f"---ALL CATEGORIES CLEARED FROM CACHE---")
    
    def append_to_list(self, key: str, value: Any) -> bool:
        """APPEND A VALUE TO A LIST IN THE CACHE"""
        if key in self._cache:
            if isinstance(self._cache[key], list):
                self._cache[key].append(value)
                logger.info(f"---APPENDED VALUE TO {key} IN CACHE---")
                return True
            else:
                logger.warning(f"---ERROR: {key} IS NOT A LIST---")
                return False
        else:
            self._cache[key] = [value]
            logger.info(f"---CREATED NEW LIST WITH VALUE IN {key}---")
            return True

    def remove_from_list(self, key: str, value: Any) -> bool:
        """REMOVE A VALUE FROM A LIST IN THE CACHE"""
        if key in self._cache and isinstance(self._cache[key], list):
            try:
                self._cache[key].remove(value)
                logger.info(f"---REMOVED VALUE FROM {key} IN CACHE---")
                return True
            except ValueError:
                logger.warning(f"---VALUE NOT FOUND IN {key}---")
                return False
        else:
            logger.error(f"---ERROR: {key} NOT FOUND OR NOT A LIST---")
            return False
        
# FUNCTION TO LOAD PROMPTS
def load_prompts(path: Path) -> dict:
    """Load prompts from a yaml file.

    Args:
        path (Path): Path to `prompts.yaml`

    Returns:
        dict: Prompt Name - Prompt Value pair
    
        example output:
            {"sys_prompt" : "You are a helpful agent."}
    """
    with open(path, 'r') as file:
        prompts = yaml.safe_load(file)
    
    logger.info(f"---PROMPTS LOADED FROM {path}---")
    return prompts

# Function to visualize a compiled langgraph workflow
def visualize_graph(graph_bytes: bytes):
    
    logger.info("Displaying compiled state graph visualization.")
    # Convert bytes to image
    img = mpimg.imread(BytesIO(graph_bytes))
    
    # Display image
    plt.figure(figsize=(12, 8))
    plt.title("Compiled State Graph Visualization")
    plt.imshow(img)
    plt.axis('off')
    plt.show()