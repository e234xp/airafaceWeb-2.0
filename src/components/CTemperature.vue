<template>
    <div class=carditem>
        <div class="registerFace">
            <img class="photo" v-show="photoImage != undefined" :src="`data:image/jpeg;base64,${photoImage}`" />
        </div>
        <div class="employeeno oneline">
            <template v-if="areaA !== 'undefined'">{{ areaA }}</template>
        </div>

        <div class="info" :style="`background-image: linear-gradient(to bottom, ${bgcolor1}, ${bgcolor2})`"
            :class=status>
            <div class="fullname oneline">
                <template v-if="areaB !== 'undefined'">{{ areaB }}</template>
            </div>
            <div class="row cardrow">
                <div class="oneline temperature">
                    <template v-if="areaC !== 'undefined'">{{ areaC }}</template>
                </div>
                <div class="timestamp justify-content-end">{{entryTime}}</div>
            </div>
            <div class="eventMsg" :class="[manualLeave ?　'd-flex align-items-center' : '']">
                <span class="statusIcon"></span>{{itemMessage}}
                <!-- <button v-if="manualLeave" type="button" @click.prevent="$emit('remove-entry-person')"
                    class="btn btn-sm btn-leave btn-secondary ml-auto mr-2">
                    <img src="/img/exit.svg" alt="">
                </button> -->
            </div>
        </div>
        <div v-show="action" class="row" style="margin-left: 0; margin-right: -0.4rem;">
            <div class="col-6" style="padding-left: 0; padding-right: 0;" @click=leftbuttom()>
                <!-- <div class=leftbuttom>{{ disp_acknowledge }}</div> -->
            </div>
            <div class="col-6" style="padding-left: 0; padding-right: 0;" @click=rightbuttom()>
                <!-- <div class="rightbuttom">{{ disp_falsealarm }}</div> -->
            </div>
        </div>
    </div>
</template>
<script>
    import i18n from '@/i18n';

    export default {
        name: 'CTemperature',
        props: {
            objectId: String,
            temperatureArea: String,
            faceId: String,
            person_id: String,
            status: String,
            bgcolor1: String,
            bgcolor2: String,
            group: String,
            photoImage: String,
            entryTime: String,
            leaveTime: String,
            itemMessage: String,
            areaA: String,
            areaB: String,
            areaC: String,
            action: Boolean,
            manualLeave: {
                type: Boolean,
                default: false,
            }
        },
        methods: {
            leftbuttom() { this.$emit('onConfirmed', this); },
            rightbuttom() { this.$emit('ocCanceled', this); },
        },
        data() {
            return {
                disp_acknowledge: i18n.formatter.format('Acknowledge'),
                disp_falsealarm: i18n.formatter.format('FalseAlarm')
            }
        }

    }
</script>

<style lang='scss' scoped>
    .btn-leave {
        padding: 0.25rem 0.25rem !important;
        background-color: rgba(108, 117, 125, 0.2);
        text-align: center;

        &:hover {
            background-color: rgba(108, 117, 125, 0.6);
        }

        img {
            opacity: .8;
            object-fit: contain;
            width: 3.2rem;
            height: 1.8rem;
        }
    }

    // ========== card Item  ==========
    .carditem {
        width: 31.4rem;
        height: 16rem;
        padding: .7rem;
        float: left;
    }

    .carditem .registerFace {
        float: left;
        width: 12.8rem;
        height: 12.8rem;
    }

    .carditem .photo {
        width: 12.8rem;
        height: 12.8rem;
        border-radius: .4rem;
    }

    .carditem .info {
        padding-left: 11rem;
    }

    .carditem .fullname {
        text-shadow: 0 -0.1rem 0 rgba(0, 0, 0, 0.3);
        font-size: 1.8rem;
        font-weight: 600;
        font-family: Arial, 'Microsoft JhengHei', 'sans-serif';
        color: white;
        height: 4.4rem;
        display: block;
        padding-top: 1.7rem;
    }

    .carditem .temperature {
        text-shadow: 0 -0.1rem 0 rgba(0, 0, 0, 0.3);
        font-family: Arial;
        font-size: 2rem;
        font-weight: normal;
        color: white;
        display: block;
        padding-left: 0;
        max-width: calc(100% - 7.4rem);
    }

    .event .carditem .leftbuttom {
        margin-top: 1rem;
        margin-right: .5rem;
        height: 4.4rem;
        border: .1rem solid #7f8e8f;
        font-size: 1.6rem;
        text-align: center;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .event .carditem .rightbuttom {
        margin-top: 1rem;
        margin-left: .5rem;
        height: 4.4rem;
        border: .1rem solid #7f8e8f;
        font-size: 1.6rem;
        text-align: center;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .carditem .timestamp {
        padding-right: 0;
        font-family: Arial, 'Microsoft JhengHei', 'sans-serif';
        font-size: 1.2rem;
        color: white;
        display: flex;
        align-items: flex-end;
        padding-bottom: .6rem;
        margin-left: auto;
    }

    .carditem .eventMsg {
        padding-top: .6rem;
        padding-left: .6rem;
        padding-bottom: .6rem;
        font-size: 1.6rem;
        color: white;
    }

    .carditem .eventMsg .statusIcon {
        width: 2.4rem;
        height: 2.4rem;
        margin-right: 1rem;
        float: left;
        background-image: url('/img/capacity/normal.png');
        background-repeat: no-repeat;
        background-size: cover;
    }

    .carditem .danger .statusIcon {
        background-image: url('/img/capacity/danger.png');
    }

    .carditem .warning .statusIcon {
        background-image: url('/img/capacity/warning.png');
    }

    .carditem .eventIcon {
        width: 2.4rem;
        height: 2.4rem;
    }

    .carditem .photo {
        float: left;
        width: 12.8rem;
        height: 12.8rem;
        border-radius: .4rem;
    }

    .carditem .employeeno {
        font-family: Arial;
        font-size: 1.4rem;
        min-height: 2.1rem;
        color: white;
        padding-left: 1rem;
    }

    .carditem .CCC {
        text-shadow: 0 -0.1rem 0 rgba(0, 0, 0, 0.3);
        font-family: Arial;
        font-size: 1.4rem;
        color: white;
    }

    .carditem .info {
        border-radius: .4rem;
        box-shadow: 0 .2rem .4rem 0 rgba(0, 0, 0, 0.3);
        // background-image: linear-gradient(to bottom, #7e8e8f, #485556);
        margin-left: 2.8rem;
        width: 27.2rem;
        height: 12rem;
        padding-left: 11rem;
    }

    .carditem .info .cardrow {
        margin-left: 0;
        margin-right: .6rem;
        border-bottom: .2rem solid #ffffff;
    }

    .carditem .warning {
        background-image: linear-gradient(to bottom, #ffbb67 2%, #ffa435);
    }

    .carditem .danger {
        background-image: linear-gradient(to bottom, #eb7d7d, #d24747);
    }

    .carditem .departed {
        background-image: linear-gradient(to bottom, #a3a3a3, #c0c0c0);
    }

    .oneline {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    @media (max-width: 768px) {
        .carditem .info {
            width: 27.2rem;
            height: 12rem;
            padding-left: 11.3rem;
        }

        .carditem .fullname {
            padding-top: 1.3rem;
        }

        .carditem .timestamp {
            display: inline-flex;
            flex: 0 0 5rem;
        }

        .carditem .temperature {
            display: inline-flex;
            flex: 0 0 2rem;
        }

        .carditem .employeeno {
            padding-left: 1rem;
        }
    }
</style>