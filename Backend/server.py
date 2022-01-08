from flask import Flask, request, url_for, send_from_directory
from werkzeug.utils import secure_filename
from flask.json import jsonify
from PIL import Image 
import os

app = Flask(__name__)

UPLOAD_FOLDER = os.path.abspath('Backend/uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/uploads/<name>')
def download_file(name):
    return send_from_directory(app.config["UPLOAD_FOLDER"], name)


# img to pdf
@app.route("/convertor", methods=['POST'])
def convertor():
    files = request.files
    #file = files.get('file').read()
    file_name = files.get('file')

    print(file_name.filename)

    filen = file_name.filename.split('.')[0]
    filename = secure_filename(f'{filen}.pdf')

    # Convert img to pdf
    img1 = Image.open(file_name)
    img = img1.convert('RGB')
    img.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    img_url = url_for('download_file', name=filename)

    print(img_url)


    response = jsonify(img_url)
    response.headers.add('Access-Control-Allow-Origin', '*')
    
    return response


if __name__ == "__main__":
    app.run(debug=True)
