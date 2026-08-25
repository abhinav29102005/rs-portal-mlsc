import os

filepath = "src/components/proposals/ProposalModal.tsx"
with open(filepath, "r") as f:
    content = f.read()

target1 = """  useEffect(() => {
    setMounted(true);
  }, []);"""

replacement1 = """  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);"""

target2 = """      } catch (err: any) {
        setError(err.message || "Failed to submit request");
      }"""

replacement2 = """      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to submit request");
      }"""

new_content = content.replace(target1, replacement1).replace(target2, replacement2)
with open(filepath, "w") as f:
    f.write(new_content)
