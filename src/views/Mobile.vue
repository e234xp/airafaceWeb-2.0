<template>
  <div>
    <input type='file' v-on:change='imageFileListener'>
    <img src="data:image/png;base64,${value_imageB64}" style='width: 200px; height: 200px;' />
    {{value_imageB64}}
    <input type="button" value="upload" />
  </div>
</template>

<script>
  export default {
    name: 'Mobile',

    data() {
      return {
        value_fileName: '',
        value_imageB64: '',
      };
    },
    activated() {

    },

    mounted() {

    },

    methods: {
      imageFileListener(evt) {
        const self = this;

        console.log('evt', evt);
        console.log('evt.target.files[0]', evt.target.files[0]);

        const file = evt.target.files[0];

        const fileReader = new FileReader();
        fileReader.onloadend = async () => {
          try {
            // var image = new Image();
            self.value_imageB64 = fileReader.result;
          } catch (ex) {
            console.log('ex', ex);
          }
          // resolve();
        };

        fileReader.readAsDataURL(file);
      },
    },
  };
</script>