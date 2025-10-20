<script lang="ts">
  export let classes: string = '';
  export let onClick: () => void = () => {};
</script>

<div class={'rounded-2xl overflow-hidden ' + classes} {...$$restProps} on:click={onClick}>
  <slot />
</div>
