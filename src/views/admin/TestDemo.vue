<template>
    <div class="hello">
        hello,world
        {{ name }}
        {{ age > 15 ? "大朋友" : "小朋友" }}
        <input type="text" v-bind:value="name" />
        <input type="text" :value="age" />
        <img :src="src">
        <input type="button" value="保存" v-on:click="handleSave" />
        <input type="button" value="保存" @click="handleSave" />
        <input type="text" v-model="name" />
        <input type="button" @click="handChange" />
        <div v-if="sex == 1">男</div>
        <div v-else-if="sex == 0">女</div>
        <div v-else>未知</div>
    </div>



</template>

<script>
import axios from 'axios'
export default {
    name: 'TestDemo',
    props: {
        msg: String
    },
    data() {
        return {
            name: '张三',
            age: 15,
            src: 'https://www.baidu.com',
            sex: 1
        }
    },
    methods: {
        handleSave() {
            alert(this.name)
        },
        handChange() {
            this.name = '李四'
        }
    }
    // setup(){
    //     return{

    //     };
    // }

}

</script>