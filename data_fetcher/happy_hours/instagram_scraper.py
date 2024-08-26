# import requests
# from bs4 import BeautifulSoup

# # Example URL (This URL is for demonstration and won't work with Instagram)
# url = 'https://www.instagram.com/happyhour.philly/?hl=en'

# # Send a GET request to the website
# response = requests.get(url)
# response.raise_for_status()  # This will raise an exception for HTTP errors

# # Parse the HTML content of the page with BeautifulSoup
# soup = BeautifulSoup(response.text, 'html.parser')

# with open('instagram.html', 'w') as f:
#     f.write(soup.prettify())

# # Define the XPath-like path to the elements (note: BeautifulSoup does not use XPath)
# # We'll convert the example XPath to a CSS selector for demonstration purposes
# # Example XPath: /html/body/div[2]/div/div/div[2]/div/div/div[1]/div[1]/div[2]/div[2]/section/main/div/div[3]/div
# # Convert this to a CSS selector manually for BeautifulSoup use

# selector = 'div:nth-of-type(2) > div > div > div:nth-of-type(2) > div > div > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > section > main > div > div:nth-of-type(3) > div'
# elements = soup.select(selector)

# # Store the text of each element in a list
# elements_text = [element.text for element in elements]

# print(elements_text)

import os

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from webdriver_manager.chrome import ChromeDriverManager

# Path to the ChromeDriver
# chrome_driver_path = '/path/to/chromedriver'

# URL of the Instagram account
url = 'https://www.instagram.com/happyhour.philly/?hl=en'

# XPath to target element
xpath = '/html/body/div[2]/div/div/div[2]/div/div/div[1]/div[1]/div[2]/div[2]/section/main/div/div[3]/div'

def setup_driver():
    # Setup Chrome options
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument('--ignore-certificate-errors')
    chrome_options.add_argument('--incognito')
    chrome_options.add_argument('--headless')  # Run in headless mode if you don't need a browser UI
    
    # Initialize the WebDriver
    # service = Service(chrome_driver_path)
    
    # driver = webdriver.Chrome(service=service, options=chrome_options)
    
    driver = webdriver.Chrome(
                                    service=Service(ChromeDriverManager().install()), 
                                    options=chrome_options
                                )

    chrome_bin = os.environ.get("GOOGLE_CHROME_BIN", "chromedriver")
    chrome_options.binary_location = chrome_bin
    
    driver.set_page_load_timeout(30)
    return driver

def scrape_instagram():
    driver = setup_driver()
    try:
        # Open the URL
        driver.get(url)
        
        # Wait for the page to load and elements to appear
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, xpath))
        )
        
        # Find the elements at the specified XPath
        elements = driver.find_elements(By.XPATH, xpath)
        
        # Extract text from each element (or adjust according to needs)
        results = [elem.text for elem in elements]
        return results
    except TimeoutException:
        print("Timed out waiting for page to load")
        return []
    finally:
        # Close the driver
        driver.quit()

# Run the scraper function
data = scrape_instagram()

with open('instagram_data.txt', 'w') as f:
    f.write('\n'.join(data))
print(data)
