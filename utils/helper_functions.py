import base64

from PIL import Image
from utils.constants import ICON_SIZE

def get_scaled_dimensions(image_path: str):
    image = Image.open(image_path)
    width, height = image.size
    
    if height > width:
        return (int(ICON_SIZE * width / height), ICON_SIZE)
    else:
        return (ICON_SIZE, int(ICON_SIZE * width / height))

def get_user_location():
    import geocoder
    latlng = geocoder.ip('me').latlng
    return {'Lat' : latlng[0], 'Lng' : latlng[-1]}

def format_decode_image(path: str):
    return 'data:image/png;base64,{}'.format(base64.b64encode(open(path, 'rb').read()).decode('ascii'))

