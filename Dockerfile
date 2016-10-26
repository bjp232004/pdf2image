FROM ubuntu:latest

RUN apt-get update && apt-get install -y \
    curl git python-setuptools ruby ghostscript

RUN curl -sL https://deb.nodesource.com/setup_0.12 | bash -
RUN apt-get install -y \
    nodejs
    
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN PATH="$PATH:/usr/bin/nodejs"    

RUN curl -L https://www.npmjs.com/install.sh | sh
#RUN npm install --global gulp -y

#RUN ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Linuxbrew/install/master/install)"

RUN git clone https://github.com/Linuxbrew/brew.git ~/.linuxbrew
RUN export PATH="$HOME/.linuxbrew/bin:$PATH"
RUN export MANPATH="$HOME/.linuxbrew/share/man:$MANPATH"
RUN export INFOPATH="$HOME/.linuxbrew/share/info:$INFOPATH"
#RUN brew install imagemagick
#RUN brew install graphicsmagick
#RUN brew install imagemagick --with-webp
RUN npm install --global gm -y

RUN apt-get update -qq && apt-get install -y \
  libgs-dev \
  imagemagick \
  graphicsmagick


COPY . /usr/src/app
WORKDIR /usr/src/app

RUN git clone https://github.com/bjp232004/pdf2image.git

EXPOSE 3030 
#CMD [ "node index.js" ]
ENTRYPOINT ["node","index.js"]
CMD ["--que","1"]