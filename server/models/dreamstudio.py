import base64
import os
import requests

from dotenv import dotenv_values

config = dotenv_values(".env")

engine_id = "stable-diffusion-v1-5"
api_host = os.getenv('API_HOST', 'https://api.stability.ai')
api_key = config["STABILITY_API_KEY"]

if api_key is None:
    raise Exception("Missing Stability API key.")

def request_dreamstudio(prompt):
    response = requests.post(
        f"{api_host}/v1/generation/{engine_id}/text-to-image",
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": f"Bearer {api_key}"
        },
        json={
            "text_prompts": [
                {
                    "text": prompt
                }
            ],
            "cfg_scale": 15,
            "clip_guidance_preset": "FAST_BLUE",
            "style_preset":"fantasy-art",
            "height": 512,
            "width": 512,
            "samples": 1,
            "steps": 10,
        },
    )

    if response.status_code != 200:
        raise Exception("Non-200 response: " + str(response.text))

    return {"response": "data:image/png;base64," + response.json()["artifacts"][0]["base64"]}
