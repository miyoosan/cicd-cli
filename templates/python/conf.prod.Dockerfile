FROM python:3.9-buster

RUN mkdir /code
WORKDIR /code
COPY requirements.txt /code/
RUN pip install -i https://mirrors.aliyun.com/pypi/simple -r requirements.txt
ADD . /code/

CMD ["python", "/code/main.py"]
