from geo.Geoserver import Geoserver

# Initialize the Geoserver object
geo = Geoserver('http://geoserver:8080/geoserver', username='admin', password='geoserver')

# Define workspace and coverage store names
workspace_name = 'csn_workspace'
coveragestore_name = 'csn_coveragestore'
layer_name = 'congonhas_2018_2019'
geotiff_path = '/app/CONGONHAS_2018_2019_optimized.tif'

# Create workspace if it does not exist
workspaces = geo.get_workspaces()
print(workspaces)
if workspace_name not in [ws['name'] for ws in workspaces['workspaces']['workspace']]:
    geo.create_workspace(workspace=workspace_name)

# # Create coveragestore
geo.create_coveragestore(
    layer_name=layer_name,
    path=geotiff_path,
    workspace=workspace_name
)