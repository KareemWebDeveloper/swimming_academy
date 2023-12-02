<script>

</script>

<template>
    <div class="p-3 px-5 borderRound flex align-content-center justify-content-between msg">
        <h4 class="">
            <slot v-if="$slots.default">{{ $slots.default }}</slot>
            <slot v-else>تم الحفظ بنجاح</slot>
        </h4>
        <span class="material-symbols-outlined mt-1 text-2xl">
            check_circle
        </span>
    </div>
</template>

<style>
.msg{
    background: #c4eddd;
    border: solid #1ea97c;
    border-width: 0px 6px 0 0px;
    color: #1ea97c;
}
</style>