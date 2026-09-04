from pydantic import BaseModel

class Profile(BaseModel):
    gender: str = "Female"
    age_group: str
    health_condition: str
    occupation: str

class AdvisoryRequest(BaseModel):
    lat: float
    lon: float
    location_name: str
    profile: Profile
